import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../../plugins/axios';
import "./ForgetPs.css";

function ForgetPs() {
    const navigate = useNavigate();

    const [id, setId] = useState('');
    const [idMsg, setIdMsg] = useState('');
    const [isValidId, setIsValidId] = useState(false);

    const [email, setEmail] = useState('');
    const [emailMsg, setEmailMsg] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(false);

    const onChangeId = event => {

        const value = event.target.value;
        const replaceValue = value.replace(/(\s*)/g, ""); //공백제거
        setId(replaceValue);

        if (replaceValue.length === 0) {
            setIdMsg('')
            return;
        }

        //길이 체크
        if (replaceValue.length < 1 || 15 < replaceValue.length) {
            setIdMsg('아이디를 다시 확인해주세요')
            return;
        }

        //형식 체크 
        const namePattern = /^[0-9|a-z|A-Z|]+$/; // 아이디는 영어,숫자만가능
        // console.log(namePattern.test(replaceValue));
        if (namePattern.test(replaceValue)) {
            setIsValidId(true);
            setIdMsg("");
        } else {
            setIsValidId(false);
            setIdMsg("영문과 숫자로만 작성해주세요.");
        }

    };

    const onChangeEmail = event => {

        const value = event.target.value;
        const replaceValue = value.replace(/(\s*)/g, ""); //공백제거
        setEmail(replaceValue);

        if (replaceValue.length === 0) {
            setEmailMsg('')
            return;
        }
        //길이 체크
        if (replaceValue.length < 1 || 15 < replaceValue.length) {
            setEmailMsg('이메일을 다시 확인해주세요')
            return;
        }

        //형식 체크 
        const emailPattern = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        // console.log(namePattern.test(replaceValue));
        if (emailPattern.test(replaceValue)) {
            setIsValidEmail(true);
            setEmailMsg("");
        } else {
            setIsValidEmail(false);
            setEmailMsg("이메일을 다시 확인해주세요");
        }

    };

    const submitForm = async function (event) {
        event.preventDefault();

        if (!isValidEmail || !isValidId) {
            return;
        }
        //아이디와 이메일 일치하는 회원있을 경우 재설정 페이지로 이동
        await axios.get('/api/login/find/user', { params: { loginId: id, email: email } })
            .then((response) => {
                const data = response.data;
                console.log(response.data)
                if (data.length === 1) {
                    console.log("비밀번호존재 비밀번호 재설정 페이지로 이동");
                    navigate(`/login/find/ps/reset/${data[0].loginId}`);
                }


            })
            .catch((error) => { console.log(error) });
    };




    return (
        <div className='mainBody2'>
            <div className='navbar2'>
                <div className='navbarHead2'>아이디/비밀번호 찾기</div>
                <div className='navbarBody2'>
                    <ul>
                        <Link to="/login/find/id">
                            <li>아이디 찾기</li>
                        </Link>
                        <Link to="/login/find/ps">
                            <li>비밀번호 찾기</li>
                        </Link>
                    </ul>
                </div>
            </div>
            <div className='container2'>
                <div className='title2'>비밀번호 찾기</div>
                <hr></hr>
                <li>
                    <Link to="/login/find/id">아이디 찾기 메인;;;;; </Link>
                    <Link to="/login/find/id/result">아이디 찾기 결과;;;;; </Link>
                    <Link to="/login/find/ps">비번 찾기;;;;;</Link>
                    <Link to="/login/find/ps/reset">비번 리셋 화면;;;;;;;</Link>
                    <Link to="/login/find/ps/done">비번 리셋완료;;;;;;;;;;</Link>
                </li>
                <div className='content2'>
                    <div className='contentHeader2'>비밀번호를 잊어버리셨나요?</div>
                    <div className='contentHeader2'>비밀번호는 가입시 입력하신 아이디와 이메일을 통해 찾을 수 있습니다.</div>
                    <hr />
                    <form className="searchForm2">
                        <div className="nameInput2">

                            <input
                                name="userName"
                                className='inputBox2'
                                onChange={onChangeId}

                                placeholder="아이디를 입력해주세요"
                            />
                            {(!isValidId) && <div className='errorMessage'>{idMsg}</div>}

                        </div>
                        <div className="emailInput2">

                            <input
                                name="email"
                                className='inputBox2'
                                onChange={onChangeEmail}
                                placeholder="이메일을 입력해주세요"
                            />
                            {(!isValidEmail) && <div className='errorMessage2'>{emailMsg}</div>}

                        </div>
                        <div><button type='submit' className='searchBtn2' onClick={submitForm}>찾기</button></div>
                        <div>
                            <Link to="/">
                                <button type='button' className='backBtn2'> 로그인 화면으로 돌아가기 </button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}





export default ForgetPs;