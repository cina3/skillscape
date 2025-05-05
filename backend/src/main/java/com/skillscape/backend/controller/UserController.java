package com.skillscape.backend.controller;

import com.skillscape.backend.dto.ChangePasswordRequest;
import com.skillscape.backend.dto.UpdateAvatarResponse;
import com.skillscape.backend.exception.NotFoundException;
import com.skillscape.backend.model.User;
import com.skillscape.backend.service.CoverService;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

  private final UserService userService;
  private final CoverService coverService;

  public UserController(UserService userService,
                        CoverService coverService) {
    this.userService  = userService;
    this.coverService = coverService;
  }

  @PutMapping("/password")
  public ResponseEntity<?> changePassword(
      @AuthenticationPrincipal UserDetails ud,
      @Valid @RequestBody ChangePasswordRequest req
  ) {

    userService.verifyAndChangePassword(
        ud.getUsername(), req.getOldPassword(), req.getNewPassword());
    return ResponseEntity.ok("Password changed");
  }

  @DeleteMapping
  public ResponseEntity<?> deleteAccount(
      @AuthenticationPrincipal UserDetails ud
  ) {
    userService.deleteByEmail(ud.getUsername());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/avatar")
  public UpdateAvatarResponse uploadAvatar(
      @AuthenticationPrincipal UserDetails ud,
      @RequestParam("file") MultipartFile file
  ) throws Exception {
    User user = userService.findByEmail(ud.getUsername())
        .orElseThrow(() -> new NotFoundException("User not found"));
    String stored = coverService.storeCover(file);
    String url    = "/api/users/me/avatar/" + stored;
    userService.updateAvatarUrl(user.getId(), url);
    return new UpdateAvatarResponse(url);
  }

  @GetMapping(value="/avatar/{filename:.+}")
  public ResponseEntity<Resource> serveAvatar(
      @PathVariable String filename,
      HttpServletRequest request
  ) throws Exception {
    Resource res = coverService.load(filename);
    String ct = request.getServletContext()
              .getMimeType(res.getFile().getAbsolutePath());
    if (ct == null) ct = MediaType.APPLICATION_OCTET_STREAM_VALUE;
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(ct))
        .body(res);
  }
}