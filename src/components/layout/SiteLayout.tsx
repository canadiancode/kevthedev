import { Outlet } from 'react-router-dom'

const nav = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="layout">
        <header className="layout__header">
          <a className="brand" href="#top">
            kevthedev
          </a>
          <nav className="nav" aria-label="Primary">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <main id="main">
          <Outlet />
        </main>
      </div>
    </>
  )
}
