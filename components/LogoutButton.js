import { logoutAction } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction} className="admin-logout-form">
      <button type="submit" className="btn btn-outline">
        Log Out
      </button>
    </form>
  );
}
