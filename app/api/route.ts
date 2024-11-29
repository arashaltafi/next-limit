export async function GET(req: Request, res: Response) {
    return Response.json({ message: 'Hello from Next.js GET!' }, { status: 200 })
}

export async function POST(req: Request, res: Response) {
    return Response.json({ message: 'Hello from Next.js POST!' }, { status: 200 })
}