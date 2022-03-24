package com.chodae.find.ex.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.HttpBasicConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.chodae.find.ex.security.filter.HeaderCheckFilter;
import com.chodae.find.ex.security.filter.LoginFilter;
import com.chodae.find.ex.security.handler.LoginFailHandler;
import com.chodae.find.ex.security.jwtutil.JWTUtil;
import com.chodae.find.service.UserFindService;
import com.chodae.find.service.UserFindServiceImpl;
import com.chodae.find5.repository.UserRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter{
	private final UserRepo userRepo;
	
	
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		http.csrf().disable();
		http.cors();
		http.httpBasic().disable();
		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		
		http.authorizeHttpRequests().antMatchers("/").permitAll();
		http.authorizeHttpRequests().antMatchers("/api/login").permitAll();
		http.authorizeHttpRequests().antMatchers("/api/find/**").permitAll();
		
		//고객센터
//		http.authorizeHttpRequests().antMatchers("/faq").permitAll();
//		http.authorizeHttpRequests().antMatchers("/notice/**").permitAll();
		
		//글 조회 추가, 삭제, 수정,  테스트필요
		http.authorizeHttpRequests().antMatchers(HttpMethod.GET,"/*/").permitAll();
		http.authorizeHttpRequests().antMatchers(HttpMethod.GET,"/*/*").permitAll();
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/*/").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.PUT,"/*/*").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.DELETE,"/*/*/*").hasRole("USER");
		
		//댓글 추가 삭제 수정
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/*/*/reply").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.PUT,"/*/*/reply/*/").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.DELETE,"/*/*/reply/*/*/").hasRole("USER");
		
		//추천 추가 삭제
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/*/recomm/*/*").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.DELETE,"/*/recomm/*/*/*").hasRole("USER");
		
		//reviewmain 댓글
		http.authorizeHttpRequests().antMatchers(HttpMethod.GET,"/*/index/*").permitAll();
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/*/reply/*").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.PUT,"/*/index/*/reply/*").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.DELETE,"/*/post/*/reply/*").hasRole("USER");
		
		//마이페이지 
		http.authorizeHttpRequests().antMatchers("/mypage/**").permitAll();
		
		
		
		
		http.authorizeHttpRequests().antMatchers("/**").permitAll();
		
		

		
		
//		http.authorizeRequests().anyRequest().authenticated();
		
		http.addFilterBefore(checkFilter(), UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(loginFilter(), UsernamePasswordAuthenticationFilter.class);
	}
	
	
	//CORS허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
    	
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
	
    @Bean
    PasswordEncoder passwordEncoder() {
    	return new BCryptPasswordEncoder();
    }
    
    @Bean
    public JWTUtil jwtUtil() {
    	return new JWTUtil();
    }
    
    @Bean
    public HeaderCheckFilter checkFilter() {
    	
    	HeaderCheckFilter checkFilter = new HeaderCheckFilter("/**", jwtUtil());
   	
    	return checkFilter;
    }
    
    @Bean
    public UserFindService userFindService() {
    	
    	return new UserFindServiceImpl(userRepo, passwordEncoder(), jwtUtil());
    }
    
    
    @Bean
    public LoginFilter loginFilter() throws Exception {

    	LoginFilter loginFilter = new LoginFilter("/api/login", jwtUtil(), userFindService());
    	
    	loginFilter.setAuthenticationManager(authenticationManager());
    	
    	loginFilter.setAuthenticationFailureHandler(new LoginFailHandler());
    	
		return loginFilter;
    	
    }
    

	
}
