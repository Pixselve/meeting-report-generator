import type { GetServerSideProps, NextPage } from 'next';
import { AutoComplete, Button, Checkbox, DatePicker, Divider, Form, Input, Layout, Select, Typography } from "antd";
import nookies from "nookies";
import { useState } from "react";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { token } = nookies.get(ctx);

    const teachers = await fetch(`${ process.env.NEXT_PUBLIC_API_AUTH }/teachers`, {
      headers: {
        Authorization: `Bearer ${ token }`
      }
    }).then(value => value.json());
    const students = await fetch(`${ process.env.NEXT_PUBLIC_API_AUTH }/students`, {
      headers: {
        Authorization: `Bearer ${ token }`
      }
    }).then(value => value.json());

    return {
      props: {
        teachers: teachers.map((teacher: any) => ({ value: teacher.fullName })),
        students: students.map((student: any) => ({ value: student.fullName }))
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async ({ date, ...rest }: any) => {
    try {
      setLoading(true);
      const { token } = nookies.get(null);

      await fetch(`${ process.env.NEXT_PUBLIC_API_AUTH }/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ token }`
        },
        body: JSON.stringify({
          ...rest,
          date: date.format("YYYY-MM-DD")
        }),

      });
      await router.push("/")
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
      <Layout.Content style={ { padding: '50px' } }>

        <Form onFinish={ submit } layout="vertical">
          <Divider>Élève</Divider>
          <Form.Item name="studentFullName" required
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
          <Form.Item label="Enseignant" name="teacherFullName"
                     rules={ [{ required: true, message: "Veuillez renseigner l'enseignant de l'élève" }] }>
            <AutoComplete options={ teachers } filterOption={ (inputValue, option) =>
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }/>
          </Form.Item>

          <Divider>Rendez-vous</Divider>

          <Form.Item label="Rendez-vous à la demande de" name="meetingByDefault"
                     rules={ [{ required: true, message: "Personne n'a demandé ce rendez-vous ?" }] }>
            <Checkbox.Group>
              <Checkbox value="PARENTS">Parents</Checkbox>
              <Checkbox value="TEACHER">L&apos;enseignant</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="meetingByCustom" label="Rendez-vous à la demande de (champ libre)">
            <Select mode="tags">
            </Select>
          </Form.Item>

          <Form.Item label="Personnes présentes" name="peoplePresentDefault"
                     rules={ [{ required: true, message: "Personne n'était présent ?" }] }>
            <Checkbox.Group>
              <Checkbox value="MOTHER">Maman</Checkbox>
              <Checkbox value="FATHER">Papa</Checkbox>
              <Checkbox value="STUDENT">Élève</Checkbox>
              <Checkbox value="PRINCIPAL">Directeur</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="peoplePresentCustom" label="Personnes présentes (champ libre)">
            <Select mode="tags">
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
          <Form.Item label="Informations importantes" name="importantInformation">
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
