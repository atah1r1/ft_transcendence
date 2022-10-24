export default function Index() {
  return <div></div>;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/settings/profile",
      permanent: false,
    },
  };
}
