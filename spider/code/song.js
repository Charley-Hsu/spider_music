const async = require('async');
const agent = require('superagent');
const cheerio = require('cheerio');
const moment = require('moment');
const request = require('request');
const notifier = require('node-notifier');

const query = require('../mysql');
const {
    singerConfig,
    songConfig
} = require('../config');
const {
    limitLength,
    splitId,
    notify
} = require('../util');


const songCollect = () => {
    query('select max(singer) from song', [], (err, res, rs) => {
        let max = res[0]['max(singer)'] || 31254;
        let index = 26344;
        async.whilst(() => {
            return index <= 31254;
        }, (cb) => {
            // 从数据库中获取歌手姓名以及URL 然后开始遍历歌曲
            query('select name,url from singer where singer=?', [index], (err, res) => {
                if (!err) {
                    const singer = {
                        name: res[0].name,
                        url: res[0].url.trim()
                    }
                    agent(songConfig.common + singer.url)
                        .then(res => {
                            const $ = cheerio.load(res.text);
                            const contents = $('#song-list-pre-cache textarea');
                            const song = JSON.parse(contents.text());
                            limitLength(song, songConfig.len);
                            async.mapLimit(song, 1, (item, cbItem) => { // 并发数量N
                                // 遍历前N首歌曲 并且获取评论数量
                                const href = '/song?id=' + item.id;
                                const id = item.commentThreadId;
                                const title = item.name;
                                const url = songConfig.comment + id + '?csrf_token=';
                                songConfig.req.url = url;
                                request(songConfig.req, (err, res, body) => {
                                    if (body) {
                                        var contents = JSON.parse(body);
                                        var commet = contents.total;
                                        var content = '歌曲还没有热评';
                                        var likecount = 0;
                                        var nickname = ' ';
                                        var userid = 0;
                                        if (contents.hotComments.length > 0) {
                                            content = contents.hotComments[0].content;
                                            likecount = contents.hotComments[0].likedCount;
                                            nickname = contents.hotComments[0].user.nickname;
                                            userid = contents.hotComments[0].user.userId;
                                        }
                                        query('insert into song(title,comment,url,name,singer,content,nickname,userid,likecount) values(?,?,?,?,?,?,?,?,?)', [title, commet, href, singer.name, index, content, nickname, userid, likecount], (err, response) => {
                                            if (err) {
                                                // 说明歌曲重复 进行update操作
                                                query('update song set title=?,comment=?,name=?,singer=?,content=?,nickname=?,userid=?,likecount=? where url=?', [title, commet, singer.name, index, content, nickname, userid, likecount, href], () => {});
                                            }
                                            // 插入数据完毕
                                            cbItem();
                                        })
                                    } else {
                                        console.log('未知错误');
                                        notify('错误', '未知错误');
                                        cbItem();
                                    }
                                })
                            }, () => {
                                let percent = (index / 31254 * 100).toFixed(2);
                                console.log(index + ':' + singer.name + ' 抓取完毕,' + percent + '%完成');
                                index++;
                                cb();
                            })
                        })
                        .catch(err => {
                            // 错误处理
                            const errStr = err.toString();
                            if (errStr.includes('innerHTML')) {
                                // 页面404 直接跳到下一个歌手
                                console.log(err, singer.name + ' 页面丢失 请求的URL为' + songConfig.common + singer.url);
                                notify('请求超时', singer.name + ' 页面丢失 请求的URL为' + songConfig.common + singer.url);
                                index++;
                            } else {
                                // goto超时处理 或者服务器503
                                console.log(err, singer.name + ' 请求超时 即将重新请求 请求的URL为' + songConfig.common + singer.url);
                                notify('请求超时', singer.name + ' 请求超时 即将重新请求 请求的URL为' + songConfig.common + singer.url);
                                index++;
                            }
                            cb();
                        })
                } else {
                    // 查询错误处理
                    console.log(err, 'singer ID ' + index);
                    notify('数据库查询错误', 'singer ID ' + index);
                    index++;
                    cb();
                }
            })
        })
    })

}
module.exports = songCollect;