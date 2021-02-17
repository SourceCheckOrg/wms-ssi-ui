import React, { useState, useEffect } from "react";
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import QRCode from 'qrcode.react';
import socketIoClient from "socket.io-client";

const API_HOST=process.env.NEXT_PUBLIC_API_HOST;
const SSI_SIGNUP_PATH=process.env.NEXT_PUBLIC_SSI_SIGNUP_PATH;
const SSI_SIGNUP_URL=`${API_HOST}${SSI_SIGNUP_PATH}`;

export default function EmailConfirmation() {
  console.log('EmailConfirmation - render page');
  const [socket, setSocket] = useState()
  const [token, setToken] = useState()
  const router = useRouter();
  
  const { confirmation } = router.query;
  console.log('EmailConfirmation - confirmation: ', confirmation);
  if (confirmation && confirmation !== token) {
    setToken(confirmation);
  }

  // Create socket on component mount
  useEffect(() => {
    console.log('Creating socket.io connection to ', API_HOST)
    let newSocket = socketIoClient(API_HOST);
    
    newSocket.on("hello", data => {
      console.log("received hello server: ", data)
    });

    newSocket.on("jwt", jwtToken => {
      console.log("received jwt token:", jwtToken)
    });

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, []);

  // Listen to events related to client token
  useEffect(() => {
    if (token) {
      console.log('EmailConfirmation - client-token-sub')
      socket.emit('client-token-sub', token);
    }
  }, [token]);

  const url = `${SSI_SIGNUP_URL}?challenge=${confirmation}`;
  console.log('EmailConfirmation - SSI sign up url: ', url);
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <h2>Email confirmation</h2>
        <p>Challenge: {confirmation}</p>
        <p>Please scan the QR code using your credible Wallet to finish Sign Up</p>
        <div>
          <QRCode
            id={confirmation}
            value={url}
            size={290}
            level={"H"}
            includeMargin={true}
          />
        </div>
      </section>
    </Layout>
  )
}
