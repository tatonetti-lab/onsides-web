export const getAdverseEffect = async (id: string) => {
    const response = await fetch('/api/v1/adverseEffect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
        }),
    });
    return response.json();
}