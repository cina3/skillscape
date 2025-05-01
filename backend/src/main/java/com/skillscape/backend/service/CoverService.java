package com.skillscape.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class CoverService {
  private final Path root;
  public CoverService(@Value("${attachments.upload-dir}") String dir) throws IOException {
    this.root = Paths.get(dir).toAbsolutePath().normalize();
    Files.createDirectories(root);
  }

  public String storeCover(MultipartFile file) throws IOException {
    String ext = "";
    String orig = file.getOriginalFilename();
    int i = orig != null ? orig.lastIndexOf('.') : -1;
    if (i>0) ext = orig.substring(i);
    String stored = UUID.randomUUID()+ext;
    Files.copy(file.getInputStream(), root.resolve(stored),
               StandardCopyOption.REPLACE_EXISTING);
    return stored;
  }

  public Resource load(String name) throws MalformedURLException {
    Path file = root.resolve(name).normalize();
    return new UrlResource(file.toUri());
  }
}