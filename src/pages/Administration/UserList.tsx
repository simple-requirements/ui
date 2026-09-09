import type { UserAdministrationResponse } from "@/api/authApi";

export type UserListProps = Readonly<{
  users: readonly UserAdministrationResponse[];
  selectedUserId: string | undefined;
  onSelect: (userId: string) => void;
}>;

export function UserList({ users, selectedUserId, onSelect }: UserListProps) {
  return (
    <table className="user-administration__table">
      <caption>Registered users</caption>
      <thead>
        <tr>
          <th scope="col">User</th>
          <th scope="col">Status</th>
          <th scope="col">Email verified</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <th scope="row">
              <button
                className="user-administration__user-button"
                type="button"
                aria-pressed={selectedUserId === user.id}
                onClick={() => onSelect(user.id)}
              >
                {user.displayName} <small>@{user.username}</small>
              </button>
            </th>
            <td>{user.status}</td>
            <td>{user.emailVerifiedAt === null ? "No" : "Yes"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
