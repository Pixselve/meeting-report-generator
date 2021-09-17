import type { NextPage } from 'next';
import { Alert, Button, Form, Input, Space, Typography } from "antd";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { FirebaseError } from "@firebase/util";
import { useRouter } from "next/router";


type FormInputs = {
  email: string
  password: string
}

const Login: NextPage = () => {
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();


  const onFinish = async ({ email, password }: FormInputs) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return router.push("/");
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        console.log({ e });
        switch (e.code) {
          case "auth/user-not-found":
            setErrorMessage("Utilisateur inconnu");
            break;
          case "auth/wrong-password":
            setErrorMessage("Mot de passe incorrect");
            break;
        }
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", textAlign: "center"}}>
      <div style={{maxWidth: "500px"}}>

        <Typography.Title>Connexion</Typography.Title>
        <Form onFinish={ onFinish }>
          { errorMessage.length > 0 && <Alert style={{marginBottom: "20px"}} message={ errorMessage } type="error" showIcon/> }
          <Form.Item name="email" label="Adresse email" rules={[{required: true, message: "Veuillez saisir une adresse email"}]}>
            <Input type="email"/>
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{required: true, message: "Veuillez saisir un mot de passe"}]}>
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
