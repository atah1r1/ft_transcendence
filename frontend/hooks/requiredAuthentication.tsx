import cookie from 'cookie';

export default function requireAuthentication ( gssp: any )
{
    return async ( ctx: any ) =>
    {
        const { req } = ctx;
        if ( req.headers.cookie )
        {
            const { jwt } = cookie.parse( req.headers.cookie );
            if ( jwt === undefined )
            {
                return {
                    redirect: {
                        permanent: false,
                        destination: '/',
                    },
                };
            }
        }
        return await gssp( ctx );
    };
}