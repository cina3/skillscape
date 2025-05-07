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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;
  private final CoverService coverService;

  public UserController(UserService userService,
                        CoverService coverService) {
    this.userService  = userService;
    this.coverService = coverService;
  }

  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails == null) {
        return ResponseEntity.status(401).body("User not authenticated");
    }
    User user = userService.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new NotFoundException("User not found from token details: " + userDetails.getUsername()));

    Map<String, Object> userInfo = new HashMap<>();
    userInfo.put("id", user.getId());
    userInfo.put("email", user.getEmail());
    userInfo.put("displayName", user.getDisplayName());

    return ResponseEntity.ok(userInfo);
  }

  @PutMapping("/me/password")
  public ResponseEntity<?> changePassword(
      @AuthenticationPrincipal UserDetails ud,
      @Valid @RequestBody ChangePasswordRequest req
  ) {

    userService.verifyAndChangePassword(
        ud.getUsername(), req.getOldPassword(), req.getNewPassword());
    return ResponseEntity.ok("Password changed");
  }

  @DeleteMapping("/me")
  public ResponseEntity<?> deleteAccount(
      @AuthenticationPrincipal UserDetails ud
  ) {
    userService.deleteByEmail(ud.getUsername());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/me/avatar")
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

  @GetMapping(value="/me/avatar/{filename:.+}")
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