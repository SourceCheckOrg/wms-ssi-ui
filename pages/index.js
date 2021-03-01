import Head from 'next/head'
import utilStyles from '../styles/utils.module.css'

const ENVIRONMENT=process.env.NEXT_PUBLIC_ENVIRONMENT;

export default function Home() {

  return (
    <>
      <section className={utilStyles.headingMd}>
        <h2>Web Monetization Standard</h2>
        <p>Environment: {ENVIRONMENT}</p>
      </section>
    </>
  )
}