import { site } from '@/content/site'

export function Footer() {
  return (
    <footer className="footer">
      <span>{site.footer.line}</span>
      <span>{site.footer.copyright}</span>
    </footer>
  )
}
