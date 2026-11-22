const LINKS = ['cases', 'profile', 'flora', 'contact'] as const;

export function Header() {
  return (
    <header>
      <nav aria-label="Sections">
        {LINKS.map((id) => <a key={id} href={`#${id}`}>{id}</a>)}
      </nav>
    </header>
  );
}
