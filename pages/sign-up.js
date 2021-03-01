import fetch from "isomorphic-fetch";
import { useState } from 'react'
import ClipLoader from "react-spinners/ClipLoader";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
const SIGNUP_PATH = process.env.NEXT_PUBLIC_SIGNUP_PATH;
const SIGNUP_URL = `${API_HOST}${SIGNUP_PATH}`;

export default function Home() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucess, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function signUp(evt) {
    evt.preventDefault()
    setLoading(true)
    console.log('Sign Up - url: ', SIGNUP_URL);
    console.log(`Sign Up - username: ${username}: / email: ${email}`)
    let result;
    const res = await fetch(SIGNUP_URL, {
      body: JSON.stringify({ username, email }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    })
    result = await res.json()
    console.log(`Sign Up - result: ${JSON.stringify(result)}`)
    setLoading(false)
    if (result.statusCode && result.statusCode !== 200) {
      setError(true)
      console.log('err', result.data[0].messages[0].message)
      setErrorMessage(result.data[0].messages[0].message)
    } else {
      setSuccess(true)
    }  
  }

  if (sucess) {
    return (
      <>
        <div>
          <h2>Sign Up</h2>
          <p>We have sent you an email message containing instructions to activate your account!</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div>
          <h2>Sign Up</h2>
          <p>There was a problem processing your request: {errorMessage}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        <h2>Sign Up</h2>
        <form onSubmit={signUp}>
          <div>
            <div>
              <label htmlFor="username">Username</label>
            </div>
            <div>
              <input id="username" name="name" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
          </div>
          <div>
            <div> 
              <label htmlFor="email">Email</label>
            </div>
            <div>
            <input id="email" name="email" type="text" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <br/><button type="submit">Sign Up</button><ClipLoader color="black" loading={loading} size={20} />
          </div>
        </form>
      </div>
    </>
  )
}
