package com.skillscape.backend_new.dto; 

import lombok.Data;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor 
public class JwtResponse {

    @NonNull
    private String token;

    private String type = "Bearer";

    @NonNull
    private Long id;

    @NonNull
    private String email;

    @NonNull
    private String displayName;

}