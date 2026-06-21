-- Função RPC para criar Escola e Gestor em uma única transação
CREATE OR REPLACE FUNCTION public.create_new_school_gestor(
    p_school_name TEXT,
    p_gestor_name TEXT,
    p_gestor_email TEXT,
    p_gestor_whatsapp TEXT,
    p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_school_id UUID;
    v_user_id UUID;
    v_response JSONB;
BEGIN
    -- 1. Criar a Escola
    INSERT INTO public.schools (name, status)
    VALUES (p_school_name, 'Ativo')
    RETURNING id INTO v_school_id;

    -- 2. Criar o usuário na tabela auth.users
    -- Nota: Isso cria o usuário mas ele ainda precisará confirmar o e-mail dependendo das configs do Supabase
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        p_gestor_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', p_gestor_name, 'role', 'DIRETOR', 'whatsapp', p_gestor_whatsapp),
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO v_user_id;

    -- O trigger 'on_auth_user_created' já deve criar o perfil automaticamente,
    -- mas vamos atualizar o school_id dele.
    UPDATE public.profiles 
    SET school_id = v_school_id,
        whatsapp = p_gestor_whatsapp
    WHERE id = v_user_id;

    v_response := jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'school_id', v_school_id
    );

    RETURN v_response;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;
