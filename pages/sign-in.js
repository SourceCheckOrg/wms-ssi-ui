import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import QRCode from 'qrcode.react';
import socketIoClient from "socket.io-client";
import { v4 as uuidv4} from 'uuid';

const API_HOST=process.env.NEXT_PUBLIC_API_HOST;
const SSI_SIGNIN_PATH=process.env.NEXT_PUBLIC_SSI_SIGNIN_PATH;
const SSI_SIGNIN_URL=`${API_HOST}${SSI_SIGNIN_PATH}`;

export default function SignIn() {
  const [challenge, setChallenge] = useState()
  console.log('SignIn - render page');
  console.log('SignIn - challenge: ', challenge);
  
  // Create socket on component mount
  useEffect(() => {

    let uuid = uuidv4()
    setChallenge(uuid)

    console.log('SignIn - create socket')
    let socket = socketIoClient(API_HOST);
    
    socket.on("hello", data => {
      console.log("Received hello from server: ", data)
    });

    socket.on("jwt", jwt => {
      console.log("Received jwt token:", jwt)
    });

    socket.emit('client-token-sub', uuid);

    return () => {
      socket.disconnect()
    }
  }, []);

  const url = `${SSI_SIGNIN_URL}?challenge=${challenge}`;
  console.log('Sign In - SSI sign in url: ', url);
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div>
        <h2>Sign In</h2>
        <p>Challenge: {challenge}</p>
        <p>Please scan the QR code using your credible Wallet to Sign In</p>
        <div>
          <QRCode
            id={challenge}
            value={url}
            size={290}
            level={"H"}
            includeMargin={true}
          />
        </div>
      </div>
    </Layout>
  )
}
