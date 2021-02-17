import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

const ENVIRONMENT=process.env.NEXT_PUBLIC_ENVIRONMENT;

export default function Home() {

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Welcome to SourceCheck WMS app</p>
        <p>Environment: {ENVIRONMENT}</p>
      </section>
    </Layout>
  )
}