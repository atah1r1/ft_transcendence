import cookie from 'cookie';

export default function requireAuthentication(gssp: any) {
    return async (ctx: any) => {
        const { req } = ctx;
        const { jwt } = cookie.parse(req.headers.cookie || '');
        let data: any;
        try {
            const res = await fetch(`http://backend:9000/api/user/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `jwt=${jwt};`
                }
            })
            data = await res.json()
        } catch (e) {
            console.log(e)
        }

        if (data.statusCode === 477) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/auth',
                },
            };
        }
        if (data.statusCode === 401 || data.statusCode === 500) {
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