package com.chodae.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.chodae.repository.UserRepo;
import com.chodae.security.filter.HeaderCheckFilter;
import com.chodae.security.filter.LoginFilter;
import com.chodae.security.handler.LoginFailHandler;
import com.chodae.security.oauth.SocialLoginSuccessHandler;
import com.chodae.security.util.JWTUtil;
import com.chodae.service.UserFindService;
import com.chodae.service.UserFindServiceImpl;

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
		
		http.oauth2Login().successHandler(successHandler());
		
		http.authorizeHttpRequests().antMatchers("/").permitAll();
		
		http.authorizeHttpRequests().antMatchers(HttpMethod.GET,"/api/user/check").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.GET,"/api/user/info").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.PUT,"/api/user/info").hasRole("USER");
		http.authorizeHttpRequests().antMatchers(HttpMethod.DELETE,"/api/user/bye").hasRole("USER");
		
		http.authorizeHttpRequests().antMatchers("/api/**").permitAll();
		http.authorizeHttpRequests().antMatchers("/api/find/**").permitAll();
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/api/login").permitAll();
		http.authorizeHttpRequests().antMatchers(HttpMethod.POST,"/api/refresh").permitAll();
		
		
		
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
    
    @Bean
    public SocialLoginSuccessHandler successHandler() {
    	return new SocialLoginSuccessHandler(passwordEncoder(), jwtUtil(), userFindService());
    }
    

	
}
