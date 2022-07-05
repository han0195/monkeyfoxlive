let geochartArray;
let date;   // 날짜 배열
let country;    // 국가명(한글) 배열
let totalconfirmed; // 총 확진자, drawVisualization()에서 데이타 뽑아내는 김에 해당 변수 초기화 시킴.
let totalsuspected; // 총 유증상자


loadData(); // <--- 동기식 으로 설정되어있음
getTable();
getGeoChartData();  // <--- ajax 로드 완료 후, runFunctions() 실행.

function runFunctions(){
// 구글지오차트 로드, 밖에 꺼내놓으니 비동기로딩때문에 먼저 로딩될때도 있고 지멋대로임;;
    google.load('visualization', '1', {'packages': ['geochart']});
    google.setOnLoadCallback(drawVisualization);
    showTable();

}


// 페이지 로드시 차트 실행에 필요한 json 파일처리& 메모리 적재
function loadData(){
    $.ajax({
        url:'/statistics/loaddata',
        method:'get',
        async:false,
        success:function (args) {
            if(args===false){
                alert('예외발생. 콘솔 읽어보셈');
            }
        }
    });
}

function getTable(){
    $.ajax({
        url:'/statistics/viewgeo',
        data:{},
        method:'GET',
        success:function (jsonObject){
            console.log(jsonObject);


            let entity='';


            for(let i=0; i<jsonObject['발병국가수'];i++){
                entity+='<div>' +
                    '<input type="checkbox" value="'+jsonObject["발병국명단"][0][i]+'">' +
                    '<span> '+jsonObject["발병국명단"][0][i]+' </span>' +
                    '</div>';
            }
            $("#entity-container").html(entity);
        },
        error:function (err){
            console.log(err);
            alert("잠시후 다시 시도해주세요 : 코드 똑바로 짜시오.")
        }
    });
}

function showTable(){
    let tablecode = '<tr>\n' +
        '                        <th> </th>\n' +
        '                        <th>국가</th>\n' +
        '                        <th>확진자</th>\n' +
        '                        <th>유증상자</th>\n' +
        '                        <th>비율(%)</th>\n' +
        '                    </tr>';
    for(let i=0; i<geochartArray.length; i++){
        tablecode+='<tr>\n' +
            '                        <td>'+(i+1)+'</td>\n' +
            '                        <td>'+geochartArray[i]['국가명']+'</td>\n' +
            '                        <td>'+geochartArray[i]['확진자']+'</td>\n' +
            '                        <td>'+geochartArray[i]['유증상자']+'</td>\n' +
            '                        <td>모름%</td>\n' +
            '                    </tr>';
    }
    $('#totaltable').html(tablecode);
}


function getGeoChartData(){
    $.ajax({
        url:'/statistics/getgeochartdata',
        method:'GET',
        success:function (jsonArray){
            geochartArray = jsonArray;
            console.log(geochartArray);
            runFunctions();


        },
        error:function (err){
            console.log(err);
            alert("잠시후 다시 시도해주세요 : 코드 똑바로 짜시오.")
        }
    });
}

// Google GeoChart 정의
function drawVisualization() {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Country');
    data.addColumn('number', 'Value');
    data.addColumn({type:'string', role:'tooltip'});
    var ivalue = new Array();

    // v : 표시할 지역 설정, f : 표시할 명칭, 100 : 확진자 수 위치, 툴팁 위치
    // ivalue[v값] = url -> 클릭시 해당 url로 이동.

    for(let i=0; i<geochartArray.length; i++){
        data.addRows([[{v:geochartArray[i]['ISO'],f:geochartArray[i]['국가명']},
            geochartArray[i]['확진자'],'확진자 : '+geochartArray[i]['확진자']+'\n' +
            '유증상자 : '+geochartArray[i]['유증상자']+'']]);
        ivalue[geochartArray[i]['ISO']] = 'http://www.google.com';
        if(i===geochartArray.length-1){
            totalconfirmed = geochartArray[i]['확진자총합'];
        }
    }


    var options = {
        colorAxis: {
            colors:['#ffe1e1','#750000']
        },
        defaultColor:'#c0ffab'

    };
    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    // 이벤트 리스너, 클릭시 해당 지역의 ivalue 내의 링크 타고 들어가는 메소드.
    google.visualization.events.addListener(chart, 'select', function() {
        var selection = chart.getSelection();
        if (selection.length == 1) {
            var selectedRow = selection[0].row;
            var selectedRegion = data.getValue(selectedRow, 0);
            if(ivalue[selectedRegion] != '') { window.open(ivalue[selectedRegion]);  }
        }
    });
    chart.draw(data, options);

}






// 리턴받는 형식 :
// [ { 2022-05-18 : { KR : [ { 국가명 : 대한민국 }, { 확진자 : 10 }, { 유증상자 : 200 } ] ,
//                  { JP : [ { 국가명 : 일본 }, { 확진자 : 30 }, { 유증상자 : 100 } ] } } ,
//
//   { 2022-05-19 : { KR : [ { 국가명 : 대한민국 }, { 확진자 : 10 }, { 유증상자 : 200 } ] ,
//                  { JP : [ { 국가명 : 일본 }, { 확진자 : 30 }, { 유증상자 : 100 } ] },
//                  { CN : [ { 국가명 : 중국 }, { 확진자 : 30 }, { 유증상자 : 100 } ] } }
// ]

// 개고생해서 만들었는데 생각해보니 아직 써먹을곳이 없음. 지우지말고 일단 냅두기

// function getdataDate(){
//     $.ajax({
//         url:'/statistics/getdatadate',
//         success:function (jsonarray){
//             geochartArray = jsonarray;
//             console.log(geochartArray);
//             let dataKeys = Object.keys(geochartArray['data']);
//             console.log(dataKeys)
//
//             for(let i=0; i< dataKeys.length; i++){
//                 let datakey = dataKeys[i]
//                 console.log(datakey+' : '+geochartArray['data'][datakey])
//                 let countrykeys = Object.keys(geochartArray['data'][datakey])
//
//                 for (let j=0; j<countrykeys.length; j++){
//                     let countrykey = countrykeys[j];
//                     console.log(countrykey+' : '+geochartArray['data'][datakey][countrykey]);
//                 }
//
//             }
//
//         }
//     });
// }
