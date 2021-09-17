import type { GetServerSideProps, NextPage } from 'next';
import {
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  Layout,
  Select,
  Space,
  Typography
} from "antd";
import { firebaseAdmin } from "../lib/firebaseAdmin";
import nookies from "nookies";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const cookies = nookies.get(ctx);
    await firebaseAdmin.auth().verifyIdToken(cookies.token);

    const reports = await firebaseAdmin.firestore().collection("reports").get();
    const teachers: Set<string> = new Set();
    const students: Set<string> = new Set();
    reports.forEach(report => {
      const teacherName = report.get("teacherName");
      if (teacherName) {
        teachers.add(teacherName);
      }
      const studentName = report.get("studentName");
      if (studentName) {
        students.add(studentName);
      }
    });


    return {
      props: {
        teachers: Array.from(teachers).map(teacher => ({ value: teacher })),
        students: Array.from(students).map(student => ({ value: student }))
      }
    };
  } catch (err) {
    console.log({ err });
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    ctx.res.writeHead(302, { Location: '/login' });
    ctx.res.end();

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: {} as never };
  }
};

type Props = {
  teachers: { value: string }[]
  students: { value: string }[]
}

const New: NextPage<Props> = ({ teachers, students }) => {
  const db = getFirestore();
  const [loading, setLoading] = useState(false);


  const submit = async ({date, ...rest}: any) => {
    try {
      setLoading(true);
      await addDoc(collection(db, "reports"), {...rest, date: date.toString()});
    } catch (e) {
      console.error({ e });
    } finally {
      setLoading(false);
    }

  };

  return (
    <Layout style={ { minHeight: "100vh" } }>
      <Layout.Header>
        <Typography.Title style={ { color: "white" } } level={ 1 }>Nouveau rapport</Typography.Title>
      </Layout.Header>
      <Layout.Content style={{ padding: '50px' }}>

          <Form onFinish={ submit } layout="vertical">
            <Divider>Élève</Divider>
            <Form.Item name="studentName" required
                       rules={ [{ required: true, message: "Veuillez renseigner le nom de l'élève" }] }
                       label="Nom complet">
              <AutoComplete options={ students } filterOption={ (inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }/>
            </Form.Item>
            <Form.Item name="grade" label="Classe" required
                       rules={ [{ required: true, message: "Veuillez renseigner la classe de l'élève" }] }>
              <Select>
                <Select.Option value="CP">CP</Select.Option>
                <Select.Option value="CE1">CE1</Select.Option>
                <Select.Option value="CE2">CE2</Select.Option>
                <Select.Option value="CM1">CM1</Select.Option>
                <Select.Option value="CM2">CM2</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Enseignant" name="teacherName"
                       rules={ [{ required: true, message: "Veuillez renseigner l'enseignant de l'élève" }] }>
              <AutoComplete options={ teachers } filterOption={ (inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }/>
            </Form.Item>

            <Divider>Rendez-vous</Divider>
            <Form.Item name="meetingBy" label="Rendez-vous à la demande de"
                       rules={ [{ required: true, message: "Personne n'a demandé ce rendez-vous ?" }] }>
              <Select mode="tags">
                <Select.Option value="PARENTS">Parents</Select.Option>
                <Select.Option value="TEACHER">L&apos;enseignant</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="peoplePresent" label="Personnes présentes"
                       rules={ [{ required: true, message: "Personne n'était présent ?" }] }>
              <Select mode="tags">
                <Select.Option value="MOTHER">Maman</Select.Option>
                <Select.Option value="FATHER">Papa</Select.Option>
                <Select.Option value="STUDENT">Élève</Select.Option>
                <Select.Option value="PRINCIPAL">Directeur</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Objectifs" name="objectives"
                       rules={ [{ required: true, message: "Veuillez selectionner au moins 1 objectif" }] }>
              <Checkbox.Group>
                <Checkbox value="LEARNING">Point sur les apprentissages</Checkbox>
                <Checkbox value="JOBS">Point sur le métier d’élève (autonomie, travail personnel, contrat de
                  comportement)</Checkbox>
                <Checkbox value="RELATIONSHIPS">Point sur les relations avec les autres</Checkbox>
                <Checkbox value="ADAPTATIONS">Adaptation de la scolarité : PPRE, PAP, dossier MDPH, PPS</Checkbox>
                <Checkbox value="PROJECTS">Projet d’orientation</Checkbox>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item label="Date" rules={ [{ required: true, message: "Veuillez renseigner la date du rendez-vous" }] }
                       name="date">
              <DatePicker/>
            </Form.Item>
            <Form.Item label="Details" name="details"
                       rules={ [{ required: true, message: "Veuillez renseigner les details du rendez-vous" }] }>
              <Input.TextArea/>
            </Form.Item>
            <Form.Item label="Informations importantes" name="importantInfos">
              <Input.TextArea/>
            </Form.Item>
            <Form.Item>
              <Button loading={ loading } htmlType="submit" type="primary">Enregistrer</Button>
            </Form.Item>
          </Form>


      </Layout.Content>
    </Layout>
  );
};

export default New;
