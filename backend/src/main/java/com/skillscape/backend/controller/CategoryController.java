package com.skillscape.backend.controller;

import com.skillscape.backend.dto.CategoryRequest;
import com.skillscape.backend.model.Category;
import com.skillscape.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Category> list() {
        return service.listCategories();
    }

    @PostMapping
    public ResponseEntity<Category> create(
        @Valid @RequestBody CategoryRequest req
    ) {
        Category created = service.createCategory(req.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}