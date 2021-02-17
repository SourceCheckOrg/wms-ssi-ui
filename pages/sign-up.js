import { useState } from 'react'
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const SIGNUP_PATH = process.env.NEXT_PUBLIC_SIGNUP_PATH;
const SIGNUP_URL = `${API_HOST}${SIGNUP_PATH}`;

export default function Home() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  async function signUp(evt) {
    evt.preventDefault();
    console.log('Sign Up - url: ', SIGNUP_URL);
    console.log(`Sign Up - username: ${username}: / email: ${email}`)
    const res = await fetch(SIGNUP_URL,
      {
        body: JSON.stringify({ username, email }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    )
    const result = await res.json()
    console.log(`Sign Up - result: ${JSON.stringify(result)}`)
  }

  return (
    <Layout>
      <Head>
        <title>SourceCheck WMS - Sign Up</title>
      </Head>
      <div>
        <h2>Sign Up</h2>
        <form onSubmit={signUp}>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" name="name" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="text" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </Layout>
  )
}
