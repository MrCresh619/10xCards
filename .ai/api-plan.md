# REST API Plan

## 1. Resources

1. **Users**

   - Corresponds to the `users` table managed by Supabase Auth. Contains basic user authentication information such as email and encrypted password hash, creation timestamp, and optional confirmation timestamp.

2. **Flashcards**

   - Corresponds to the `flashcards` table. This resource holds flashcards created either manually or generated via AI. It includes fields like front, back, and links to a generation record (via `generated_id`).

3. **Generations**

   - Corresponds to the `generations` table. Represents an AI generation event, including metadata such as the model used, the count of generated flashcards, accepted counts, a hash of the source text, its length (validated to be between 1000 and 10000 characters), and generation duration.

4. **Generation Error Logs**
   - Corresponds to the `generations_error_logs` table. Stores logs for any errors encountered during the flashcard generation process.

## 2. Endpoints

### Flashcards Endpoints

- **GET /flashcards**  
  **Description:** Retrieves a paginated list of flashcards for the authenticated user.
  **Query Parameters:**

  - `page` (default: 1)
  - `limit` (default: 10)
  - `sort` (e.q., `created_at`)
  - `order` (`asc` or `desc`)
  - Optional filtering parameters (e.g., search by text in front/back).
    **Response (200 OK):**

  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question?",
        "back": "Answer.",
        "user_id": "user-uuid",
        "source": "manual",
        "generated_id": 123,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```

  **Errors:** 401 if not authenticated.

  - **GET /flashcards/{id}**  
    **Description:** Retrieves a specific flashcard by its ID.
    **Response (200 OK):** Same structure as flashcard creation response.
    **Errors:** 404 if not found; 401 if the flashcard does not belong to the authenticated user.

- **PUT /flashcards/{id}**  
  **Description:** Updates a specific flashcard.
  **Validators:**

  - `front`: String, optional, min length 3, max length 200
  - `back`: String, optional, min length 3, max length 500
  - `source`: String, optional, one of: ['manual', 'ai-edited']
  - `generated_id`: Number, required if source is changed to 'ai-full' or 'ai-edited'
    **Request JSON:** Fields to update
    **Response (200 OK):** Updated flashcard record.
    **Errors:** 400 for validation errors; 404 if not found; 401 if unauthorized.

- **DELETE /flashcards/{id}**

- **POST /flashcards**  
  **Description:** Creates one or more flashcards manually or from AI generation.
  **Validators:**

  - `flashcards`: Array, required, min length 1
  - `front`: String, required, min length 3, max length 200
  - `back`: String, required, min length 3, max length 500
  - `source`: String, required, one of: ['manual', 'ai-full', 'ai-edited']
  - `generated_id`: Number, required if source is 'ai-full' or 'ai-edited', must reference existing generation
    **Request JSON:**

  ```json
  {
    "flashcards": [
      {
        "front": "Question 1?",
        "back": "Answer 1.",
        "source": "manual"
      },
      {
        "front": "Question 2?",
        "back": "Answer 2.",
        "source": "ai-full",
        "generated_id": 123
      },
      {
        "front": "Question 3?",
        "back": "Answer 3.",
        "source": "ai-edited",
        "generated_id": 123
      }
    ]
  }
  ```

  **Response (201 Created):**

  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question 1?",
        "back": "Answer 1.",
        "source": "manual",
        "user_id": "user-uuid",
        "generated_id": null,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      },
      {
        "id": 2,
        "front": "Question 2?",
        "back": "Answer 2.",
        "source": "ai-full",
        "user_id": "user-uuid",
        "generated_id": 123,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "failed": []
  }
  ```

  **Errors:**

  - 400 on validation errors
  - 401 if not authenticated
  - Partial success possible with some flashcards failing validation

  **Description:** Deletes a specific flashcard.
  **Response:** 204 No Content upon successful deletion.
  **Errors:** 404 if not found; 401 if unauthorized.

### Generations Endpoints

- **POST /generations**  
  **Description:** Initiates an AI generation process for flashcards proposals based on supplied text.
  **Business Logic:**

  - Validate that `source_text` length is between 1000 and 10000 characters.
  - Trigger an external LLM API call.
  - Store generation details including the model used, generated count, and optionally accepted counts.
    **Request JSON:**

  ```json
  {
    "source_text": "Long text between 1000 and 10000 characters..."
  }
  ```

  **Response (201 Created):**

  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      {
        "front": "Question 1?",
        "back": "Answer 1",
        "source": "ai-full"
      },
      {
        "front": "Question 2?",
        "back": "Answer 2",
        "source": "ai-full"
      }
      // ... more flashcards
    ],
    "generated_count": 5
  }
  ```

  **Errors:** 400 for validation errors; 401 if not authenticated; 500 if external API call fails.

- **GET /generations**  
  **Description:** Retrieves a list of generation events for the authenticated user.
  **Query Parameters:** Pagination options (`page`, `limit`, `sort`, `order`).
  **Response (200 OK):** List of generation records with metadata.
  **Errors:** 401 if not authenticated.

- **GET /generations/{id}**  
  **Description:** Retrieves details of a specific generation event, including related flashcards if applicable.
  **Response (200 OK):** Generation record details.
  **Errors:** 404 if not found; 401 if unauthorized.

### Generation Error Logs Endpoints (Administration)

- **GET /error-logs**  
  **Description:** (Admin endpoint) Retrieves a list of error logs related to flashcard generation failures.
  **Response (200 OK):** List of error logs.
  **Note:** Access is restricted to admin roles.
  **Errors:** 401/403 for unauthorized access.

## 3. Authentication and Authorization

- The API uses JWT (Bearer Tokens) for authentication, leveraging Supabase Auth for user management.
- All protected endpoints require a valid JWT token provided in the `Authorization` header.
- Database-level Row-Level Security (RLS) policies ensure that users can only access their own resources.

## 4. Validation and Business Logic

- **Validation Conditions:**

  - Flashcards require non-empty `front` (max 200 characters) and `back` (max 500 characters) fields.
  - Generations require a `source_text` whose length is between 1000 and 10000 characters, as enforced by database constraints.
  - Foreign key relationships (e.g., `user_id`, `generated_id`) are enforced.
  - `source`: Must be one of `ai-full`, `ai-edited` or `manual`

- **Business Rules:**
  - **User Management:** Secure registration and authentication with proper error handling and safe password storage.
  - **Flashcard Operations:**
    - Only authenticated users can create, retrieve, update, or delete their flashcards.
    - Automatic timestamp updates (e.g., `updated_at`) are managed through database triggers.
  - **AI Generation Process:**
    - Validate input text length before making an external API call.
    - Handle API failures gracefully by returning appropriate error messages and storing error details in the `generations_error_logs` table.
    - Link generated flashcards with their corresponding generation event via the `generated_id` field.
  - **Pagination, Filtering, and Sorting:**
    - List endpoints support pagination and may include optional filtering and sorting based on flashcard content or generation metadata.

---

**Assumptions:**

- Admin endpoints (e.g., `/error-logs`) are secured and only accessible by users with elevated privileges.
- The client is responsible for storing and providing the JWT for subsequent requests.
- Integration with the external LLM API will be abstracted in a dedicated service layer, allowing easier error handling and monitoring.

This REST API plan has been designed to be in full alignment with the provided database schema, product requirements (PRD), and the specified tech stack, ensuring a secure, maintainable, and scalable solution.
