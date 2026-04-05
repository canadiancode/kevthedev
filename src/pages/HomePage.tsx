import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { Services } from '@/sections/Services'
import { Work } from '@/sections/Work'

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Work />
      <Contact />
      <Footer />
    </>
  )
}
