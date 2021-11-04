import type { NextPage } from 'next';
import { GetServerSideProps } from "next";
import { Button, Col, Layout, Row, Table, TableColumnsType, Tag, Typography } from "antd";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_AUTH + "/students", { headers: ctx.req && { Authorization: "Bearer " + ctx.req.cookies.token ?? "" } });
    if (!response.ok) throw new Error(response.statusText);
    const json = await response.json();

    return {
      props: {
        students: json
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

const Home: NextPage<any> = ({ students }) => {
  const columns: TableColumnsType<any> = [
    {
      title: 'Élève',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (a, b) => <Link href={`/students/${b.fullName}`}><a>Voir</a></Link>
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
        <Table columns={ columns } dataSource={ students }/>
      </Layout.Content>
    </Layout>
  );
};

export default Home;
