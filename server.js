const express = require('express'); //라이브러리를 첨부
const app = express(); //새로운 객체를 만든다
const bodyParser= require('body-parser') //body-parser는 요청데이터 해석을 쉽게 도와준다
app.use(bodyParser.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public')); //static파일을 보관하기위해 public폴더를 쓰겠다


var db;
MongoClient.connect('mongodb+srv://chyb627:!cha159632@chabiri.r7lh7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(에러, client){
    //연결되면 할일
    if(에러) {return console.log(에러)}

    db = client.db('todoapp');

    // db.collection('post').insertOne({이름 : 'David', _id : 100 }, function(에러, 결과){
    //     console.log('저장완료');
    // }); 

    app.listen(8080, function(){          // database 접속이 완료되면
        console.log('listening on 8080')  // 내부 코드를 실행해라(노드js 서버 띄우는 코드)
    });

})

//누군가가  /pet으로 방문을 하면 .. pet 관련된 안내문을 띄워주자

app.get('/pet', function(요청, 응답){   //PET 경로로의 GET요청을 처리하는 기계 제작
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');  //서버를 하나 만든 것
});

app.get('/', function(요청, 응답){
    응답.render('index.ejs')
})

app.get('/write', function(요청, 응답){
    응답.render('write.ejs')
})

// app.get('/', function(요청, 응답){   
//     응답.sendFile(__dirname + '/index.ejs');   // .sendFile(보낼파일경로)
// });

// app.get('/write', function(요청, 응답){   
//     응답.sendFile(__dirname + '/write.ejs');   // .sendFile(보낼파일경로)
// });

// 어떤 사람이 /add 경로로 POST 요청을 하면 ~를 해주세요 -->코드로 작성
// app.post('/add', function(요청, 응답){
//     응답.send('전송완료')
//     console.log(요청.body.title);
//     console.log(요청.body.date); 
//     //DB에 저장해주세요
// });

// 어떤 사람이 /add 경로로 POST 요청을 하면 데이터 2개(날짜, 제목)를 보내주는데
// 이 때, 'POST'라는 이름을 가진 collection에 두개 데이터를 저장하기
// {제목:'' , 날짜:''}
app.post('/add', function(요청, 응답){
    응답.send('전송완료');

    db.collection('counter').findOne({name : '게시물갯수'}, function(에러,결과){
        console.log(결과.totalPost)
        var 총게시물갯수 = 결과.totalPost;

        db.collection('post').insertOne( { _id : 총게시물갯수 +1, 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
            console.log('저장완료');

            // counter 라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야함
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc :{totalPost:1}},function(에러, 결과){
                if(에러){return console.log(에러)}
            })

        });    
    });
});

  // /list로 GET요청으로 접속하면 HTML을 보여줌
  // 실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
  
app.get('/list', function(요청, 응답){

    //DB에 저장된 POST라는 Collection 안의 <조건>인 데어터를 꺼내줘
    db.collection('post').find().toArray(function(에러, 결과){  // 데이터 다 찾아줘
        console.log(결과);
        응답.render('list.ejs',{ posts : 결과 });
    }); 

    
    
});

app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 "이승기-삭제"
    db.collection('post').deleteOne(요청.body, function(에러, 결과){  //삭제해주는 고마운 함수
        console.log('삭제완료');
        응답.status(200).send({ message : '성공했습니다' });
    }) 
})


// /detail/1 로 접속하면 1번게시물을 보여줌
// /detail/2 로 접속하면 2번게시물을 보여줌
app.get('/detail/:id', function(요청, 응답){ 
    db.collection('post').findOne({ _id : parseInt(요청.params.id)},function(에러, 결과){
        //console.log(결과);
        응답.render('detail.ejs', {data : 결과})

    })
    
});


app.get('/edit', function(요청, 응답){
    응답.render('edit.ejs')
})