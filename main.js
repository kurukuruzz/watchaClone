var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

var pool = mysql.createPool({
    connectionLimit : 4,
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'watcha',
});

var addUser = function(name, password, email, callback){
    pool.getConnection(function(err, conn) {
        if(err) {
            conn.release();
            return;
        }

        var data = {name:name, password:password, email:email};

        var exec = conn.query('insert into user set ?', data, function(err, result) {
            conn.release();
            if(err){
                return;
            }
            console.log(result);
        });
    });
}

var authUser = function(email, password, callback) {
    console.log('22222222222222');
    pool.getConnection(function(err, conn) {
        if(err) {
            conn.release();
            return;
        }
        console.log(email);
        console.log(password);
        var columns = ['email', 'password'];
        var tablename = 'user';

        var exec = conn.query("select ?? from ?? where email = ? and password = ?",
            [columns, tablename, email, password], function(err, rows) {
                console.log(rows);
                conn.release();
                console.log('실행 대상SQL: ' + exec.sql);
            if(rows.length > 0) {
                console.log('일치');
                callback(null, rows);
                return;
            } else {
                console.log('못찾음');
                callback(null, null);
            }
        });
    });
}

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/singin', (req, res) => {
    res.sendFile(__dirname + '/public/sing_in.html');
});

app.get('/singup', (req, res) => {
    res.sendFile(__dirname + '/public/sing_up.html');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/singin', (req, res) => {
    console.log('3333333333333');
    var paramEmail = req.param('email');
    var paramPassword = req.param('password');

    console.log(paramEmail);

    if(pool){
        authUser(paramEmail, paramPassword, function(err, rows) {
            if(err){
                throw err;
            }
            if(rows){
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 이메일:' + paramEmail + '</p></div>');
                res.write('<div><p>사용자 비밀번호:' + paramPassword + '</p></div>');
                res.write("<br><br><a href='/'>메인페이지로 이동하기</a></br></br>");
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>로그인 실패</h1>');
                res.write('<hr/>');
                res.write('<div><p>다른 아이디 또는 비밀번호를 입력하세요</p></div>');
                res.write("<br><br><a href='/singin'>다시 로그인 하기</a></br></br>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
        res.write('<h2>데이터 베이스 연결 실패</h2>');
        res.end();
    }
});

app.post('/singup', (req, res) => {
    var paramName = req.param('name');
    var paramEmail = req.param('email');
    var paramPassword = req.param('password');

    if(pool) {
        addUser(paramName, paramPassword, paramEmail), function(err, result) {
            if(err) {
                throw err;
            }

            if(result) {
                res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else {
                res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        }
    } else {
        res.writeHead('200', {'Content-Type': 'text/html; charset=utf8'});
        res.write('<h2>데이터 베이스 연결 실패</h2>');
        res.end();
    } 
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>회원가입 성공</h1>');
    res.write("<br><br><a href='/'>메인페이지로 돌아가기</a></br></br>");
    res.write("<br><br><a href='/singin'>로그인 페이지로 이동하기</a></br></br>");
    res.end();
});



app.use((req, res) => {
    res.sendFile(__dirname + "/404.html");
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});