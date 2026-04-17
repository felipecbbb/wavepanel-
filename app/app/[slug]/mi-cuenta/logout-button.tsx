import { logoutStudentAction } from '../auth/actions';

export default function LogoutButton({ schoolSlug }: { schoolSlug: string }) {
  const action = logoutStudentAction.bind(null, schoolSlug);
  return (
    <form action={action}>
      <button className="font-label text-[0.72rem] text-muted hover:text-navy underline">
        Cerrar sesión
      </button>
    </form>
  );
}
