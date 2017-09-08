const songConfig = {
    common: 'https://music.163.com',
    comment: 'https://music.163.com/weapi/v1/resource/comments/',
    len: 10,
    key: {
        encSecKey: '01e7a181ecbcd3e1a66536ada83fbbe6d172084bfae6ba6b0bffe51284659e9cfaa47e6697080cf8ce51fd4281caca783ae88b3540e8c4c9fba1f0bd0e07090a80e2b213be0baa7628f8c16c441712cc73e114787a6b0cd582296b3b7bfe4445121d2cc5b31abd13722c57d027fa0e2e05339c8e5db42b6b1572d2f5b9ff7e26',
        params: '8as1VJSD4/IIXlFI7wjcIFc4f5EX8wHyI0o4AD17gO+vgZp/daQuS9/fBTpby+sChqTCG23Id86wuMRov8jwzfpxVfS06XdhZdigmyT71N1Be8ya6Npe+aXjgD8MQcCg7OtcgUXI2cfHNpUbQf0LBJRipAgulz5z98B/1iro8/hCaSPtwgW5SSXFpQmqRGzLCi1guGc3Vd70FKTgMFkR8xjT7pLOKz1ZKhpfKJw8LqA='
    },
    agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
}
songConfig.req = {
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': songConfig.agent
    },
    form: songConfig.key
}
module.exports = songConfig;