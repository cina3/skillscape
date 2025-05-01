// backend/src/main/java/com/skillscape/backend/service/CategoryService.java
package com.skillscape.backend.service;

import com.skillscape.backend.model.Category;
import com.skillscape.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public List<Category> listCategories() {
        return repo.findAll();
    }

    public Category createCategory(String name) {
        repo.findByName(name).ifPresent(c ->
            { throw new IllegalArgumentException("Category already exists: " + name); });
        return repo.save(Category.builder().name(name).build());
    }
}