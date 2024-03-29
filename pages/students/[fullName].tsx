import { Alert, Button, Col, Divider, Layout, Popconfirm, Row, Table, TableColumnsType, Typography } from "antd";
import { GetServerSideProps, NextPage } from "next";
import nookies from "nookies";
import Head from "next/head";
import requestMaker from "../../lib/requestMaker";
import { useRouter } from "next/router";


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const fullName = ctx.params?.fullName;
    const response = await fetch(process.env.NEXT_PUBLIC_API_AUTH + "/reports/" + fullName, { headers: ctx.req && { Authorization: "Bearer " + ctx.req.cookies.token ?? "" } });
    if (!response.ok) throw new Error(response.statusText);
    const json = await response.json();
    if (json.length === 0) {
      ctx.res?.writeHead(302, { Location: "/" });
      ctx.res.end();
      return { props: {} as never };
    }
    return {
      props: {
        years: json.map((year: any) => ({ fromTo: `${ year.from } - ${ year.to }`, ...year })),
        fullName
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
  years: { from: number, to: number, fromTo: string }[];
  fullName: string;
};

const StudentPage: NextPage<Props> = ({ years, fullName }) => {
  const router = useRouter();

  async function download(from: number, to: number) {
    const { token } = nookies.get(null);


    const response = await fetch(process.env.NEXT_PUBLIC_API_AUTH + "/reports/" + fullName + "/" + from + "/" + to, { headers: { Authorization: "Bearer " + (token ?? "") } });
    if (!response.ok) throw new Error(response.statusText);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ fullName }_${ from }_${ to }.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const columns: TableColumnsType<any> = [
    {
      title: 'Année scolaire',
      dataIndex: 'fromTo',
      key: 'fromTo',
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (a, b) => <Button onClick={ () => download(b.from, b.to) }>Télécharger les rapports</Button>
    },
  ];

  async function deleteStudent() {
    try {
      await requestMaker("/students/" + fullName, { method: "DELETE" });
      await router.push("/");
    } catch (e) {
      alert("Une erreur est survenue lors de la suppression de cet élève");
      console.error({ e });
    }
  }

  return (
    <Layout style={ { minHeight: "100vh" } }>
      <Head><title>Rapports de { fullName }</title></Head>
      <Layout.Header>
        <Row justify="space-between">
          <Col><Typography.Title style={ { color: "white" } } level={ 1 }>Rapports
            de { fullName }</Typography.Title></Col>
          <Col>

          </Col>
        </Row>


      </Layout.Header>
      <Layout.Content>
        <Table columns={ columns } dataSource={ years }/>
        <Divider/>
        <Alert showIcon message="Zone de Danger"
               description={ `Utilisez ce bouton afin de supprimer définitivement toutes les données associées à ${ fullName }.` }
               type="error" action={
          <Popconfirm onConfirm={ deleteStudent } okText="Oui"
                      title={ `Voulez-vous vraiment supprimer définitivement toutes les données associées à ${ fullName } ?` }>
            <Button danger>Supprimer</Button>
          </Popconfirm>

        }/>
      </Layout.Content>
    </Layout>
  );
};
export default StudentPage;
