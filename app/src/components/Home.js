import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useWallet } from '@solana/wallet-adapter-react';
import fetch from 'node-fetch';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import LoadingButton from './util/LoadingButton';
import Loading from './util/Loading';
import Error from './util/Error';

const encoder = new TextEncoder();

const Home = () => {
    const [error, setError] = useState(undefined);
    const [token, setToken] = useState(undefined);
    const [jwt, setJwt] = useState(undefined);
    const wallet = useWallet();

    const fetchAndAssignToken = async () => {
        setError(undefined);

        try {
            const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    publicKey: wallet.publicKey.toString()
                })
            });

            if (!response.ok) {
                setError('Failed to get token');
                return;
            }

            // get the access token and have the user sign it
            const body = await response.json();
            const accessToken = body.access_token;

            const accessTokenU8IntArray = encoder.encode(accessToken);
            const signedMessage = await wallet.signMessage(accessTokenU8IntArray);

            const signedtoken = bs58.encode(signedMessage);
            setToken(signedtoken);
            setJwt(accessToken);
        } catch (err) {
            setError(err.message);
        }

        // const result = nacl.sign.detached.verify(encoder.encode(accessToken), signedMessage, wallet.publicKey.toBytes());
    };

    const fetchJwks = async () => {
        setError(undefined);

        try {
            const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/.well-known/jwks.json`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Origin: 'http://localhost:3000'
                }
            });

            const responseBody = await response.json();
            console.log(responseBody);
        } catch (err) {
            console.log(err);
            setError(err.message);
        }
    };

    if (wallet.connecting) {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        <Loading />
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!wallet.connected) {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        Please Connect a Wallet
                    </Col>
                </Row>
            </Container>
        );
    }

    const showToken = () => {
        if (!token) {
            return (
                <span />
            );
        }

        return (
            <Row>
                <Col>
                    <p>
                        {`Token: ${token}`}
                    </p>
                </Col>
                <Col>
                    <p>
                        {`JWT: ${jwt}`}
                    </p>
                </Col>
            </Row>
        );
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Error message={error} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <LoadingButton onClick={fetchAndAssignToken}>
                        Get Signed Token
                    </LoadingButton>
                </Col>
            </Row>
            <Row>
                <Col>
                    <LoadingButton onClick={fetchJwks}>
                        Get JWKS
                    </LoadingButton>
                </Col>
            </Row>
            {showToken()}
        </Container>
    );
};

export default Home;
