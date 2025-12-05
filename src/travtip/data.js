export async function getRaceData(fetchUrl) {
    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Cookie': 'BIGipServer~rikstoto~nr-pr-webcache-webcache-xvarnish-webcache-xvarnish-http-80=!lqrM+QtCJeEOWYntpxGAnN/j9BCRm71nmEh8Jpqn2QZGllG3Wn2Bry1Fuu2Gm0M6zrlyu2Gg98s1a1PD7hMHhmcgDwcc1JxN404mOpU='
            },
            redirect: 'follow'
        });
        const raceData = await response.text();
        return raceData
    }
    catch (error) {
        const responseMessage = {
            status: 500,
            body: 'Error fetching data! Response: ' + error
        }
        console.error('Error: ', error);
        return responseMessage
    }
}