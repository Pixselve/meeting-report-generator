import type { NextPage } from 'next';
import { GetServerSideProps } from "next";
import { Button, Col, Layout, Row, Table, TableColumnsType, Tag, Typography } from "antd";
import nookies from "nookies";
import { firebaseAdmin } from "../lib/firebaseAdmin";
import { DownloadOutlined } from "@ant-design/icons";
import { generateAndDownloadPDF } from "../lib/pdf";
import Link from "next/link"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const cookies = nookies.get(ctx);
    await firebaseAdmin.auth().verifyIdToken(cookies.token);

    const reports = await firebaseAdmin.firestore().collection("reports").get();


    return {
      props: {
        reports: reports.docs.map((data) => {
          const { date, ...rest } = data.data();
          return { ...rest, date: date.toString() };
        })
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

const Home: NextPage<any> = ({ reports }) => {


  const columns: TableColumnsType<any> = [
    {
      title: 'Élève',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Classe',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Personnes présentes',
      dataIndex: 'peoplePresent',
      key: 'peoplePresent',
      render: (peoplePresents: any[]) => peoplePresents.map(peoplePresent => <Tag
        key={ peoplePresent }>{ peoplePresent }</Tag>)
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (a, b, index) => <Button onClick={ () => generateAndDownloadPDF(reports[index]) } shape="circle"
                                       icon={ <DownloadOutlined/> }/>
    },
  ];

  return (
    <Layout style={ { minHeight: "100vh" } }>
      <Layout.Header>
        <Row justify="space-between">
          <Col><Typography.Title style={ { color: "white" } } level={ 1 }>Rapports</Typography.Title></Col>
          <Col>
            <Link href="/new">
              <Button type="primary">Nouveau</Button>
            </Link>

          </Col>
        </Row>



      </Layout.Header>
      <Layout.Content>
        <Table columns={ columns } dataSource={ reports }/>
      </Layout.Content>
    </Layout>
  );
};

export default Home;
