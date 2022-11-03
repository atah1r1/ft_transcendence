export default function Index ()
{
  return <></>;
}

export async function getServerSideProps ()
{
  return {
    redirect: {
      destination: "/settings/profile",
      permanent: false,
    },
  };
}
