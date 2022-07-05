package com.monkey.mpox.controller;

import com.monkey.mpox.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@RestController
public class NewsController {

    @Autowired private NewsService newsService;

    @GetMapping("/getnews")
    public void getnews(HttpServletResponse response){
        try{
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            response.getWriter().print(newsService.getnews());
        }catch(Exception e){

        }

    }
}