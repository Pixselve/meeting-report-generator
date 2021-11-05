import nookies from "nookies";

export default function requestMaker(url: string, init?: RequestInit): Promise<Response> {
  const { token } = nookies.get(null);
  return fetch(`${process.env.NEXT_PUBLIC_API_AUTH}${url}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${ token }`,
    },
  });
}
