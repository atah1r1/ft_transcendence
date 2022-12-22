import cookie from 'cookie';

export default function requireAuthentication(gssp: any) {
    return async (ctx: any) => {
        const { req } = ctx;
        const { jwt } = cookie.parse(req.headers.cookie || '');

        const res = await fetch(`http://localhost:9000/api/user/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `jwt=${jwt};`
            }
        })
        const data = await res.json()
        if (data.statusCode === 401) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/',
                },
            };
        }
        return await gssp(ctx);
    };
}