interface Props {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: Props) {
  return (
    <div className="navbar">
      <h1 className="logo">Tech Store ⚡</h1>
      <button className="secondary" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}