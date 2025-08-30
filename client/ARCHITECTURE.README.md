# Frontend Architecture

This document provides an overview of the frontend architecture for the Tone Changer project, focusing on technical decisions, state management (especially undo/redo), and error/edge case handling.

---

## Technical Architecture Decisions & Trade-offs

- **Custom Undo/Redo Implementation**: Instead of using the `redux-undo` library, undo/redo functionality is implemented manually in `toneSlice.ts` using two stacks (`undoStack` and `redoStack`). This approach provides more control over the undo/redo logic and allows for custom constraints (e.g., limiting stack size to 50).
- **Redux Toolkit**: State management is handled with Redux Toolkit for its simplicity, type safety, and integration with TypeScript.
- **History as State**: All tone changes and user actions are stored in a `history` array, with each entry representing a snapshot of the application's state at a given time. This enables time travel and easy restoration of previous states.
- **Trade-offs**:
  - Manual stack management for undo/redo increases code complexity but avoids the overhead and limitations of third-party libraries.
  - Limiting undo stack size to 50 prevents excessive memory usage but may restrict deep undo operations for power users.

---

## State Management & Undo/Redo Functionality

- **State Structure**: The slice maintains a `history` array, a `currentHistoryIndex`, and two stacks for undo/redo operations.
- **Adding History**: Each new action creates a new history entry with a unique ID and timestamp. The current index is pushed to the undo stack before updating.
- **Undo**: Pops the last index from the undo stack, pushes the current index to the redo stack, and updates the current selection.
- **Redo**: Pops the last index from the redo stack, pushes the current index to the undo stack, and updates the current selection.
- **Selection**: Selecting a history item also updates the undo stack and clears the redo stack.
- **Try Again**: Tracks how many times a user has retried a tone change for a given history entry.
- **Clear/Reset**: Provides actions to clear all history or reset the current selection.

This design ensures that users can reliably undo and redo tone changes, with all state transitions tracked and reversible.

---

## Error Handling & Edge Cases

- **Index Validation**: All actions that update the current history index validate the index to prevent out-of-bounds errors.
- **Stack Limits**: Undo stack is limited to 50 entries to avoid excessive memory usage.
- **Graceful Fallbacks**: If an undo/redo operation is not possible (e.g., stack is empty), the state remains unchanged.
- **Try Again Logic**: The code checks for the existence of a history item before incrementing its retry count, preventing undefined errors.
- **Selectors**: Selectors return `null` if there is no valid current history, ensuring components can handle empty states gracefully.

---

## API Handling & Redux Caching (RTK Query)

The application uses **Redux Toolkit Query (RTK Query)** for efficient API integration and caching. The `api.ts` file defines an API slice using `createApi`, which manages all network requests and caching automatically.

### API Handling
- **Base Query**: Uses `fetchBaseQuery` with the base URL from environment variables, allowing easy configuration for different environments.
- **Endpoints**: The `changeTone` mutation endpoint sends a POST request to `/tone` with the request body, integrating directly with the backend (Mistral AI API).
- **Type Safety**: Request and response types are strictly defined, ensuring reliable data flow and reducing runtime errors.
- **Hooks**: RTK Query generates React hooks (e.g., `useChangeToneMutation`) for easy integration in components.

### Redux Caching
- **Automatic Caching**: RTK Query caches API responses in Redux state, reducing redundant network requests and improving performance.
- **Cache Invalidation**: Mutations and queries can be configured to invalidate or refetch data as needed, ensuring UI consistency.
- **Optimistic Updates**: RTK Query supports optimistic updates, allowing the UI to update immediately while awaiting server confirmation.
- **Error Handling**: API errors are handled within the query/mutation lifecycle, enabling components to display error states or retry actions.

This approach ensures that API interactions are efficient, reliable, and maintainable, with minimal boilerplate and robust caching out of the box.

---

## Summary

The frontend architecture is designed for reliability and control, with custom undo/redo logic, robust state management, and careful handling of edge cases. Manual stack management allows for tailored behavior, while Redux Toolkit and TypeScript ensure maintainability and type safety. The approach balances performance, usability, and code clarity for a seamless user experience.