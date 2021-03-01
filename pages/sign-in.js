import React, { useState, useEffect, useContext } from "react";
import Router from "next/router";
import Cookie from "js-cookie";
import QRCode from 'qrcode.react';
import socketIoClient from "socket.io-client";
import { v4 as uuidv4} from 'uuid';
import AppContext from "../context/AppContext";

const API_HOST=process.env.NEXT_PUBLIC_API_HOST;
const SSI_SIGNIN_PATH=process.env.NEXT_PUBLIC_SSI_SIGNIN_PATH;
const SSI_SIGNIN_URL=`${API_HOST}${SSI_SIGNIN_PATH}`;

export default function SignIn() {
  const { user, setUser } = useContext(AppContext);

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

    // TODO handle sign in errors (like user not registered etc)

    socket.on("auth", auth => {
      console.log("Received jwt token:", auth.jwt)
      Cookie.set("token", auth.jwt);
      setUser(auth.user);
      Router.push("/");
    });

    socket.emit('client-token-sub', uuid);

    return () => {
      socket.disconnect()
    }
  }, []);

  const url = `${SSI_SIGNIN_URL}?challenge=${challenge}`;
  console.log('Sign In - SSI sign in url: ', url);
  return (
    <>
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
    </>
  )
}
