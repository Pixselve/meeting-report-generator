import type { NextPage } from 'next';
import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import nookies from "nookies";


type FormInputs = {
  email: string
  password: string
}

const Login: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();


  const onFinish = async ({ email, password }: FormInputs) => {
    try {
      setLoading(true);

      const response = await fetch(process.env.NEXT_PUBLIC_API_AUTH + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: email, password })
      });
      if (!response.ok) throw new Error(response.statusText);

      const { access_token } = await response.json();

      nookies.set(null, "token", access_token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      });


      return router.push("/");
    } catch (e: unknown) {
      console.log({ e });

    } finally {
      setLoading(false);
    }

  };

  return (
    <div style={ {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      textAlign: "center"
    } }>
      <div style={ { maxWidth: "500px" } }>

        <Typography.Title>Connexion</Typography.Title>
        <Form onFinish={ onFinish }>
          { errorMessage.length > 0 &&
          <Alert style={ { marginBottom: "20px" } } message={ errorMessage } type="error" showIcon/> }
          <Form.Item name="email" label="Adresse email"
                     rules={ [{ required: true, message: "Veuillez saisir une adresse email" }] }>
            <Input type="email"/>
          </Form.Item>
          <Form.Item name="password" label="Mot de passe"
                     rules={ [{ required: true, message: "Veuillez saisir un mot de passe" }] }>
            <Input type="password"/>
          </Form.Item>
          <Form.Item>
            <Button loading={ loading } htmlType="submit" type="primary">Connexion</Button>
          </Form.Item>
        </Form>
      </div>
    </div>

  );
};

export default Login;
