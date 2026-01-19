# Architectural Anti-Patterns (The "Rejection List")

## 1. Premature Optimization
*   **Criteria**: Introducing caching (Redis/Memcached) before seeing a slow query log.
*   **Solution**: "Make it work, then make it fast."

## 2. Generic Hell
*   **Criteria**: Creating a `BaseService<T, U, V>` when you only have one service.
*   **Solution**: Write concrete code. Abstraction follows duplication (Rule of Three).

## 3. Tool Fetishism / Resume Driven Development
*   **Criteria**: Adding a new dependency (e.g., Redux, GraphQL) just because it's popular, when `useState` or REST is sufficient.
*   **Solution**: Use the "Boring Stack".

## 4. Microservices Envy
*   **Criteria**: Splitting a simple app into 3 services to "decouple" them.
*   **Solution**: Monolith First.

## 5. Zombie Code
*   **Criteria**: Commented out code "just in case".
*   **Solution**: Delete it. Git has history.
