export const getUserQuery = (id) => ({
  query: `query getUser($id: Int!) {
    getUser(id: $id) {
      id
      name
      email
      accountSubscription {
        currentUsage {
            premiumHeadlinesRemaining
        }
      }
    }
  }
  `,
  variables: { id: Number(id) },
});
