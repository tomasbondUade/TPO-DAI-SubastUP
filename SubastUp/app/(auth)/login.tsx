import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSizes, Spacing, Radius } from '../../constants/theme';

type Tab = 'login' | 'register';

export default function LoginScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }
    try {
      setLoading(true);
      const { user, token } = await authService.login({ email, password, rememberUser });
      setAuth(user, token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }
    try {
      setLoading(true);
      const { user, token } = await authService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      setAuth(user, token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Atención', 'Ingresá tu email primero para recuperar la contraseña.');
      return;
    }
    try {
      await authService.forgotPassword(email);
      Alert.alert('Éxito', 'Revisá tu email para restablecer la contraseña.');
    } catch {
      Alert.alert('Error', 'No se pudo enviar el email de recuperación.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            {/* Reemplazá por tu logo real:
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
            */}
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoIcon}>▲</Text>
            </View>
            <Text style={styles.logoTitle}>SubastUp</Text>
            <Text style={styles.logoSubtitle}>AUCTION MOBILE APP</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
              onPress={() => setActiveTab('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'register' && styles.tabBtnActive]}
              onPress={() => setActiveTab('register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          {activeTab === 'login' && (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity
                style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Ingresar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.rememberRow}>
                <Switch
                  value={rememberUser}
                  onValueChange={setRememberUser}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.white}
                  ios_backgroundColor={Colors.border}
                />
                <Text style={styles.rememberText}>Recordar Usuario</Text>
              </View>

              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <View style={styles.form}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={regName}
                onChangeText={setRegName}
                autoCapitalize="words"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity
                style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    paddingTop: Spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoIcon: {
    fontSize: 32,
    color: Colors.primary,
  },
  logoImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
  },
  logoTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.tabInactive,
    borderRadius: Radius.md,
    padding: 4,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.tabInactiveText,
  },
  tabTextActive: {
    color: Colors.white,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    width: '100%',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  rememberText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
  forgotBtn: {
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});
