# Firestore Security Specification - Switch It Up

## Data Invariants
1. Users can only read and write their own profile document (`/users/{userId}`).
2. Users can only read and write their own cart items (`/users/{userId}/cart/{itemId}`).
3. Cart items must have a valid `productId`, `name`, and `price`.
4. Timestamps (`updatedAt`, `addedAt`) must be server-validated.
5. All IDs must be valid alphanumeric strings.

## The "Dirty Dozen" Payloads (Anti-Tests)

### Identity Spoofing
1. **P1**: Attempt to create `/users/anotherUserUID` with my own UID in the data. (DENIED)
2. **P2**: Attempt to read `/users/anotherUserUID/cart/item1` as a different user. (DENIED)
3. **P3**: Attempt to update `/users/myUID/cart/item1` and change the `addedAt` to a past date manually. (DENIED)

### Data Integrity
4. **P4**: Create cart item with a negative price. (DENIED)
5. **P5**: Create cart item with a 1MB string as the `productId`. (DENIED)
6. **P6**: Create cart item missing the `name` field. (DENIED)
7. **P7**: Update cart item to change its `productId` (Immortality check). (DENIED)

### Resource Exhaustion
8. **P8**: Create user profile with a 10KB `displayName`. (DENIED)
9. **P9**: Create cart item with an array of 10,000 tags if we added tags. (N/A but guarded)
10. **P10**: Inject HTML/Script into `displayName`. (Handled by client but guarded by size)

### State Logic
11. **P11**: Update a cart item that doesn't exist. (DENIED)
12. **P12**: Read all users' carts using a blanket query without a filter. (DENIED)

## Test Runner (Simplified Logic)
- Verify `isOwner(userId)`
- Verify `isValidUser(data)`
- Verify `isValidCartItem(data)`
